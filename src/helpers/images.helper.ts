import {supabase} from '../lib/initSupabase';

const imagesHelper = {
  getPublicUrlByImageName: (imageName: string) => {
    return supabase.storage.from('swapold').getPublicUrl(imageName).data
      .publicUrl;
  },
};
export default imagesHelper;
