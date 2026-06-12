import { Route, Routes } from 'react-router-dom'; // we import those to setup the routing
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Add from './pages/Add'
import Orders from './pages/Orders'
import { useEffect, useState } from 'react';
import Login from './components/Login';
import { ToastContainer} from 'react-toastify';
import ProductsList from "./pages/ProductsList";
import EditProduct from "./pages/EditProduct";
import MaintenanceControl from './pages/MaintenanceControl';
import DeliveryFeeControl from './pages/DeliveryFeeControl';
import AddCoupon from './pages/AddCoupon';
import Dashboard from './pages/Dashboard';
import NancyHomeControl from './pages/NancyHomeControl';
import CategoriesManager from './pages/CategoriesManager';
import SubcategoryStudio from './pages/SubcategoryStudio';
import PageImagesManager from './pages/PageImagesManager';

export const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "") // this how we get the env var
export const currency = '$';
const App = () => {

  const [token,setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token'):''); // here we ask if this token available in the local storage so save it in the state var that is [token,setToken] else add nothing to local storage or emty string

 useEffect(()=> // this use effect mean if anysomthing change event will happen
  { 
    if (token) {
      localStorage.setItem("token",token); // ✅ Save the actual token string
    } else {
      localStorage.removeItem("token");
    }
 // we adding our token to the local storage so if i close or refresh the website it will still saved on the local storage
  },

  [token] // here whenever the token will upadated so in the localstorage we will save the data of token 
)
  return (

    <div className='min-h-screen bg-white'>
      <ToastContainer/>

      {token === "" ? <Login setToken = {setToken}/> /* here is the turnery how its work if token === "" emty string so return the login page else return all our page */ 
       : <> {/* here this mean (:) as (else) so  else return all our pages if the login page not equal "" */ }
     <div className='flex min-h-screen w-full overflow-x-hidden'>
        <Sidebar/>

        <div className='min-w-0 flex-1 text-base text-black'>
        <Navbar setToken = {setToken}/>
        <div className='mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8'> 

        <Routes>
        <Route path="/" element={<Dashboard token={token} />} />
        <Route path="/dashboard" element={<Dashboard token={token} />} />
        <Route path="/maintenance" element={<MaintenanceControl token={token} />} />
        <Route path="/products" element={<ProductsList token={token} />} />
        <Route path="/edit/:id" element={<EditProduct token={token} />} />
        <Route path="/nancy-home" element={<NancyHomeControl token={token} />} />
        <Route path="/subcategory-studio" element={<SubcategoryStudio token={token} />} />
        <Route path="/categories" element={<CategoriesManager token={token} />} />
        <Route path="/page-images" element={<PageImagesManager token={token} />} />
        <Route path='/add' element={<Add token={token}/>} /> 
        <Route path='/orders' element={<Orders token={token}/>} /> 
        <Route path='/delivery' element={<DeliveryFeeControl token={token}/>} /> 
        <Route path='/cuppon' element={<AddCoupon token={token}/>} /> 
        </Routes>
       
        </div>
        </div>
     </div>
     </> // this an empty div or fragment
} {/*here is the close of the turnerry operatior  */}
    </div>
      
  );
};

export default App;
