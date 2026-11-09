from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from api.models import *
from django.utils import timezone
from django.db import transaction
from django.utils.text import slugify
from datetime import datetime
import random

# Faker setup
from faker import Faker
faker = Faker()


class Command(BaseCommand):
    help = "Seed the database"

    def log(self, text, tag="INFO", k=-1, n=-1):
        styles = {
            "INFO": None,
            "SUCCESS": self.style.SUCCESS,
            "WARNING": self.style.WARNING,
            "ERROR": self.style.ERROR,
        }
        style = styles.get(tag.upper())
        count = f"{k + 1}/{n}" if k != -1 and n != -1 else ""
        line = f"{datetime.now()} [{tag.upper()}] {text} {count}"
        self.stdout.write(style(line) if style else line)

    def handle(self, *args, **options):
        try:
            with transaction.atomic():
                self.seed()
        except Exception as e:
            self.log(f"An unexpected error occured: {e}", "error")

    def seed(self):
        # Logging
        self.log("Starting tag seeding...")

        # 1. Tags seeding
        tempTags = []
        tagLength = 100
        for i in range(tagLength):
            # Logging
            self.log("seeding tag", k=i, n=tagLength)

            tag = Tag(name=faker.word())
            tempTags.append(tag)

        tags = Tag.objects.bulk_create(tempTags)

        # 2. Category seeding

        # Logging
        self.log("Starting Category seeding...")

        temp_categories = []
        categoryLength = 1000
        i = 0
        seen = set()
        while len(temp_categories) < categoryLength:
            # Logging
            self.log("seeding categories", k=i, n=categoryLength)
            i += 1
            unslugged = " ".join(faker.words(nb=2)).title()
            slug = slugify(unslugged)
            if slug in seen:
                continue
            seen.add(slug)
            temp_categories.append(Category(name=unslugged, slug=slug))

        # Create category tree (parents are always earlier in the list, so they're saved first)
        for index, category in enumerate(temp_categories):
            if index > 0 and random.random() < 0.3:
                category.parent = random.choice(
                    temp_categories[:index])
            category.save()

        categories = temp_categories

        # # 3. User seeding

        # Logging
        self.log("Starting User seeding...")

        tempUser = []
        hash = make_password("test1234")
        userLength = 1000

        for i in range(userLength):
            # Logging
            self.log("seeding users", k=i, n=userLength)
            user = User(
                username=faker.unique.user_name(),
                first_name=faker.first_name(),
                last_name=faker.last_name(),
                email=faker.email(),
                password=hash
            )
            tempUser.append(user)

        users = User.objects.bulk_create(tempUser)

        # 4. Product seeding
        tempProduct = []
        productLength = 50000

        # Logging
        self.log("Starting Product seeding...")

        for i in range(productLength):
            # Logging
            self.log("seeding products", k=i, n=productLength)

            product = Product(
                name=faker.catch_phrase(),
                description=faker.paragraph(nb_sentences=5),
                price=round(random.uniform(0, 1000), 2),
                stock=random.randint(0, 1000)
            )
            tempProduct.append(product)

        products = Product.objects.bulk_create(
            tempProduct, batch_size=500)

        # 5. Link tag and category to product

        # Logging
        self.log("Starting Linking category and tag to product..")

        CatThrough = Product.categories.through
        TagThrough = Product.tags.through
        cat_links, tag_links = [], []
        for p in products:
            for c in random.sample(categories, k=1):
                cat_links.append(CatThrough(
                    product_id=p.pk, category_id=c.pk))
            if random.random() < 0.7:
                for t in random.sample(tags, k=random.randint(0, 3)):
                    tag_links.append(TagThrough(
                        product_id=p.pk, tag_id=t.pk))
        CatThrough.objects.bulk_create(cat_links, batch_size=500)
        TagThrough.objects.bulk_create(tag_links, batch_size=500)

        # 6. Review seeding

        # Logging
        self.log("Starting Review seeding...")

        tempReview = []
        reviewLength = 50000

        for i in range(reviewLength):
            # Logging
            self.log("seeding reviews", k=i, n=reviewLength)

            review = Review(
                rating=random.randint(1, 5),
                comment=faker.text(
                    max_nb_chars=random.randint(300, 1000)),
                created_at=faker.date_time_between(
                    start_date='-5y', end_date='now'),
                user=random.choice(users),
                product=random.choice(products),
            )
            tempReview.append(review)

        reviews = Review.objects.bulk_create(
            tempReview, batch_size=500)

        # 7. Order seeding

        # Logging
        self.log("Starting Order seeding...")

        tempOrder = []
        orderLength = 500

        for i in range(orderLength):
            # Logging
            self.log("seeding orders", k=i, n=orderLength)

            order = Order(
                user=random.choice(users)
            )
            tempOrder.append(order)

        orders = Order.objects.bulk_create(tempOrder)

        # 8. OrderItem seeding

        # Logging
        self.log("Starting OrderItem seeding...")

        tempOrderItem = []
        orderItemLength = 1000

        for i in range(orderItemLength):
            # Logging
            self.log("seeding items to orders", k=i, n=orderItemLength)

            product = random.choice(products)

            orderItem = OrderItem(
                order=random.choice(orders),
                quantity=random.randint(1, 10),
                product=product,
                unit_price=product.price
            )
            tempOrderItem.append(orderItem)

        orderItems = OrderItem.objects.bulk_create(tempOrderItem)

        self.log("Database has been seeded successfully", "success")
