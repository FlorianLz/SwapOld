export default interface IArticleData {
  id: number;
  title: string;
  title2?: string;
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
  ownerInfos?: {id: number; username: string; avatar_url: string};
  receiverInfos?: {id: number; username: string; avatar_url: string};
  status: number;
  status1?: boolean;
  status2?: boolean;
}
