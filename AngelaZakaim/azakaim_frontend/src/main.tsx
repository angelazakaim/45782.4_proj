import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Layout } from './Components/LayoutArea/Layout/Layout'
import { setupAxiosInterceptors } from './Utils/axiosConfig'

/* 
    code to configure axios default behaviour 
    each request will run this code BEFORE being sent
*/

// ⭐ Setup axios interceptors BEFORE rendering
setupAxiosInterceptors();

// axios.interceptors.request.use(request => {
//     const token = localStorage.getItem('token');
//     if(token){
//         request.headers.Authorization = 'Bearer ' + token
//     }
//     return request;
// })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Layout/>
  </StrictMode>
)
