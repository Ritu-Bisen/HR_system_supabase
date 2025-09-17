
import supabase from "../../SupabaseClient";

export const postIndentDataApi=async(rowData)=>{
   try {
        const{data,error} = await supabase
        .from("indent")
         .insert({
            post:rowData.post,
            gender:rowData.gender,
            prefer:rowData.prefer,
            number_of_posts:rowData.number_of_post,
            competition_date:rowData.competition_date,
            social_site:rowData.social_site,
            status:rowData.status,
            experience:rowData.experience,
            social_site_types:rowData.social_site_types,
         });
       
         if (!error) {
            console.log("post succefully",data)
            
        } else {
           console.log("error when posting data",error) 
        } 
        return data;
    } catch (error) {
       console.log("error from supabase",error);
        
    }
}



export const fetchIndentData = async () => {
  try {
    const { data, error } = await supabase
      .from('indent')
      .select('*')
       .order("timestamp", { ascending: true }); 

    if (error) {
      console.log("Error when fetching data", error);
      
    }

else{
 console.log("fetch data successfully", data);
}
   
    return data;

  } catch (error) {
    console.log("Error from Supabase", error);
   
  }
};
