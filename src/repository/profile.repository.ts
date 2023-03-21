import {supabase} from '../lib/initSupabase';

const profileRepository = {
  getProfile: async (idUser: string) => {
    const {data} = await supabase.from('profiles').select('*').eq('id', idUser);
    return data ? data[0] : {};
  },
};
export default profileRepository;
