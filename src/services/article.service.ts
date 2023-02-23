import articleRepository from '../repository/article.repository';

const articleService = {
  getAllArticles: () => {
    return articleRepository.getAllArticles();
  },
};
export default articleService;
