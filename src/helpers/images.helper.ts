import {supabase} from '../lib/initSupabase';

const imagesHelper = {
  getPublicUrlByImageName: (imageName: string) => {
    console.log(imageName);
    return supabase.storage.from('swapold').getPublicUrl(imageName).data
      .publicUrl;
  },
};
export default imagesHelper;
