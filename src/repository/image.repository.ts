import {supabase} from '../lib/initSupabase';
import uuid from 'react-native-uuid';

const imageRepository = {
  /**
   * Envoie une image vers le service de stockage de Supabase et retourne le chemin vers l'image téléchargée.
   * @param {object} imageObject - L'objet image contenant l'URI de l'image et son type MIME.
   * @param {string} [path='/'] - Le chemin relatif dans le bucket de stockage de Supabase où l'image doit être stockée.
   * @param {string} [bucketName='swapold'] - Le nom du bucket de stockage de Supabase.
   * @returns {Promise<string | boolean>} - Le chemin vers l'image téléchargée ou `false` si une erreur s'est produite lors de l'envoi de l'image.
   */
  async uploadImage(imageObject: any, path = '/', bucketName = 'swapold') {
    const imageData = imageObject;
    const uri = imageData.uri;
    const type = 'image/png';
    //const type = imageData.type;
    const fileExtension = uri.split('.').pop();
    const name = `${uuid.v4()}.${fileExtension}`;
    const imagePath = `${path}${name}`;

    const imageToUpload = new FormData();

    imageToUpload.append('file', {uri, type, name});
    const {error} = await supabase.storage
      .from(bucketName)
      .upload(imagePath, imageToUpload);

    if (error) {
      return false;
    }
    return imagePath;
  },

  /**
   * Supprime toutes les images d'un article stockées dans le bucket "swapold" de Supabase Storage.
   * @function deleteAllImagesFromBucket
   * @param {string} idUser - L'identifiant de l'utilisateur possédant l'article.
   * @param {number} idArticle - L'identifiant de l'article dont les images doivent être supprimées.
   * @returns {Promise<Object>} Un objet contenant un booléen "error" indiquant s'il y a eu une erreur lors de la suppression, et éventuellement un message d'erreur dans "message".
   */
  async deleteAllImagesFromBucket(idUser: string, idArticle: number) {
    let del = await supabase.storage
      .from('swapold')
      .list(`${idUser}/${idArticle}`);
    if (del.error) {
      return {error: true, message: del.error.message};
    } else {
      if (del.data.length > 0) {
        const filesToRemove = del.data.map(
          x => `${idUser}/${idArticle}/${x.name}`,
        );
        const {error: supprError} = await supabase.storage
          .from('swapold')
          .remove(filesToRemove);
        if (supprError) {
          return {error: true, message: supprError};
        } else {
          return {error: false};
        }
      } else {
        return {error: false};
      }
    }
  },
};

export default imageRepository;
