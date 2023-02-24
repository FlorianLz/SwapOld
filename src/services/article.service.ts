import articleRepository from '../repository/article.repository';

const articleService = {
  getAllArticles: () => {
    return articleRepository.getAllArticles();
  },
  getArticleById: (id: number) => {
    return articleRepository.getArticleById(id);
  },
};
export default articleService;
