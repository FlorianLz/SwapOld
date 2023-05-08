import imageRepository from '../repository/image.repository';
import articleRepository from '../repository/article.repository';

const ImageService = {
  /**
   * Télécharge une image et la lie à un article existant en base de données.
   * @param {any} imageObject - L'objet image à télécharger.
   * @param {number} id_article - L'identifiant de l'article auquel l'image est liée.
   * @param {string} [path='/'] - Le chemin du dossier où stocker l'image.
   * @param {string} [bucketName='swapold'] - Le nom du bucket S3 dans lequel stocker l'image.
   * @returns {Promise<{error: boolean}>} - Un objet contenant une propriété "error" indiquant si une erreur s'est produite lors de l'opération.
   */
  async uploadImage(
    imageObject: any,
    id_article: number,
    path = '/',
    bucketName = 'swapold',
  ) {
    const upload = await imageRepository.uploadImage(
      imageObject,
      path,
      bucketName,
    );
    if (!upload) {
      return {error: true};
    }
    return await articleRepository.addImageToArticle(id_article, upload);
  },

  /**
   * Supprime toutes les images d'un article du bucket S3
   * @param idUser - L'identifiant de l'utilisateur propriétaire de l'article
   * @param idArticle - L'identifiant de l'article contenant les images à supprimer
   * @returns Une promesse qui contient un objet avec la propriété 'error' qui indique si une erreur est survenue
   * et la propriété 'message' qui contient le message d'erreur, si une erreur est survenue.
   */
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
