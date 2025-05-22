from django.core.management.base import BaseCommand
from backend.admin_portal.models import APIKeyStorage

class Command(BaseCommand):
    help = 'Stores an encrypted API key in the database.'

    def add_arguments(self, parser):
        parser.add_argument('key_name', type=str, help='The name of the API key.')
        parser.add_argument('key_value', type=str, help='The value of the API key.')
        parser.add_argument(
            '--print_encrypted_key',
            action='store_true',
            help='Print the encrypted key to stdout instead of only storing it.'
        )

    def handle(self, *args, **options):
        key_name = options['key_name']
        key_value = options['key_value']
        print_encrypted_key = options['print_encrypted_key']

        api_key_object = APIKeyStorage.store_api_key(key_name, key_value)

        if print_encrypted_key:
            # Fetch the key object again to ensure we have the latest state,
            # or use the returned object if store_api_key returns it.
            # Assuming store_api_key returns the saved object.
            encrypted_key_value = api_key_object.encrypted_key
            self.stdout.write(f"Encrypted key: {encrypted_key_value}")

        self.stdout.write(self.style.SUCCESS(
            f"API key '{key_name}' stored successfully." +
            (" It was also printed to stdout." if print_encrypted_key else "")
        ))
