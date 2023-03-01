export default interface IArticleData {
  id: number;
  title: string;
  description: string;
  created_at: Date;
  location: {latitude: number; longitude: number};
  location_name: string;
  images: string | string[];
  id_profile: number;
  username: string;
  distance: number;
  isLiked: boolean;
  hideLike: boolean;
  isOwner: boolean;
}
