import imageRepository from '../repository/image.repository';
import articleRepository from '../repository/article.repository';
import {supabase} from '../lib/initSupabase';

const ImageService = {
  async uploadImage(
    imageObject: any,
    id_article: number,
    path = '/',
    bucketName = 'swapold',
  ) {
    console.log('BEFORE UPLOAD', imageObject);
    const upload = await imageRepository.uploadImage(
      imageObject,
      path,
      bucketName,
    );
    console.log('AFTER UPLOAD', upload);
    if (!upload) {
      return {error: true};
    }
    console.log('upload', upload);
    return await articleRepository.addImageToArticle(id_article, upload);
  },
  async deleteAllImagesFromBucket(idUser: string, idArticle: number) {
    const deleteAll = await imageRepository.deleteAllImagesFromBucket(
      idUser,
      idArticle,
    );
    if (deleteAll.error) {
      return {error: true, message: deleteAll.message};
    } else {
      return {error: false};
    }
  },
};

export default ImageService;
