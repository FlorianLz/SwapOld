import articleRepository from '../repository/article.repository';
import articleFactory from '../factory/article.factory';

const articleService = {
  getAllArticles: async () => {
    const rawArticles = await articleRepository.getAllArticles();
    return articleFactory.getAllArticles(rawArticles);
  },
  getArticleById: (id: number) => {
    return articleRepository.getArticleById(id);
  },
};
export default articleService;
