

import supabase from "../../SupabaseClient";

export const LoginCredentialsApi = async ({ username, password }) => {
  console.log(username);
  console.log(password);
  
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_name',username)
    .eq('password',password)
    .single(); // get a single user
console.log(data);

  if (error || !data) {
    return { error: 'Invalid username or password' };
  }

  return { data };
};
