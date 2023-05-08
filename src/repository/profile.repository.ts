import {supabase} from '../lib/initSupabase';

const profileRepository = {
  /**
   * Récupère le profil d'un utilisateur en fonction de son identifiant
   * @param idUser - L'identifiant de l'utilisateur dont on veut récupérer le profil
   * @returns Un objet représentant le profil de l'utilisateur correspondant à l'identifiant fourni. Si l'utilisateur n'existe pas, un objet vide est retourné.
   */
  getProfile: async (idUser: string) => {
    const {data} = await supabase.from('profiles').select('*').eq('id', idUser);
    return data ? data[0] : {};
  },
};
export default profileRepository;
