from supabase import create_client, Client
from decouple import config
import os

# Initialize Supabase client
supabase: Client = create_client(
    config('SUPABASE_URL'),
    config('SUPABASE_KEY')
)

def get_supabase_client() -> Client:
    """Get the Supabase client instance."""
    return supabase 