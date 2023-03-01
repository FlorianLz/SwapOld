import {supabase} from '../lib/initSupabase';
import uuid from 'react-native-uuid';

const imageRepository = {
  async uploadImage(imageObject: any, path = '/', bucketName = 'swapold') {
    const imageData = imageObject?.assets[0];
    const uri = imageData.uri;
    const type = imageData.type;
    const fileExtension = uri.split('.').pop();
    const name = `${uuid.v4()}.${fileExtension}`;
    const imagePath = `${path}${name}`;

    const imageToUpload = new FormData();

    imageToUpload.append('file', {uri, type, name});

    const {error} = await supabase.storage
      .from(bucketName)
      .upload(imagePath, imageToUpload);

    if (error) {
      console.error(error);
      return false;
    }
    return imagePath;
  },
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
        console.log(filesToRemove);
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
