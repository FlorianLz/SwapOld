export interface IArticleData {
  id: number;
  title: string;
  description: string;
  created_at: Date;
  location: {latitude: number; longitude: number};
  articles_images: [{id: number; image_name: string}];
  articles_profiles: [{id_profile: number; profiles: {username: string}}];
}
