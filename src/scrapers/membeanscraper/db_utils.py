from datetime import datetime
from typing import Dict, List
from .db_config import get_supabase_client

def store_membean_data(data: Dict) -> bool:
    """
    Store Membean data in Supabase.
    
    Args:
        data (Dict): The Membean data to store
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        supabase = get_supabase_client()
        
        # Prepare the data for storage
        record = {
            'timestamp': data['timestamp'],
            'url': data['url'],
            'data': data,  # Store the entire data object as JSON
            'created_at': datetime.now().isoformat()
        }
        
        # Insert the data into the membean_data table
        result = supabase.table('membean_data').insert(record).execute()
        
        return True
    except Exception as e:
        print(f"Error storing Membean data: {e}")
        return False

def get_latest_membean_data() -> Dict:
    """
    Retrieve the latest Membean data from Supabase.
    
    Returns:
        Dict: The latest Membean data or None if not found
    """
    try:
        supabase = get_supabase_client()
        
        # Query the latest record
        result = supabase.table('membean_data')\
            .select('*')\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]['data']
        return None
    except Exception as e:
        print(f"Error retrieving latest Membean data: {e}")
        return None 