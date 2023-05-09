import {supabase} from '../lib/initSupabase';

const imagesHelper = {
  /**
   * Récupère l'URL publique d'une image stockée sur Supabase.
   * Si le nom de l'image est null, l'URL par défaut d'un avatar sera renvoyée.
   * @param {string | null} imageName - Le nom de l'image à récupérer.
   * @returns {string} - L'URL publique de l'image.
   */
  getPublicUrlByImageName: (imageName: string | null) => {
    return imageName != null
      ? supabase.storage.from('swapold').getPublicUrl(imageName).data.publicUrl
      : supabase.storage.from('swapold').getPublicUrl('default/avatar.png').data
          .publicUrl;
  },
};
export default imagesHelper;
