import {createClient} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://dokxphgcfmgsihinbcjg.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva3hwaGdjZm1nc2loaW5iY2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQwNTA5OTIsImV4cCI6MTk4OTYyNjk5Mn0.8h3RzHperGbIe8zaoioM7lYdQns3jLOSvdiq3B-LHf0';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage as any,
  },
});
