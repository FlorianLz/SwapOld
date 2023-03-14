import {supabase} from '../lib/initSupabase';

const imagesHelper = {
  getPublicUrlByImageName: (imageName: string | null) => {
    return imageName != null
      ? supabase.storage.from('swapold').getPublicUrl(imageName).data.publicUrl
      : supabase.storage.from('swapold').getPublicUrl('default/avatar.png').data
          .publicUrl;
  },
};
export default imagesHelper;
