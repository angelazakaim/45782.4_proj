// Routing.tsx — includes Cart, Checkout, and Orders routes
import { Navigate, Route, Routes } from "react-router-dom";
import "./Routing.css";
import { Home } from "../../HomeArea/Home/Home";
import { NotFound } from "../../NotFound/NotFound";
import { Products } from "../../ProductsArea/Products/Products";
import { AboutUs } from "../../AboutUs/AboutUs";
import { ProductDetails } from "../../ProductsArea/ProductDetails/ProductDetails";
import { AddProduct } from "../../ProductsArea/AddProduct/AddProduct";
import { EditProduct } from "../../ProductsArea/EditProduct/EditProduct";
import { Login } from "../../AuthArea/Login/Login";
import { Register } from "../../AuthArea/Register/Register";
import { Categories } from "../../CategoriesArea/Categories/Categories";
import { AddCategory } from "../../CategoriesArea/AddCategory/AddCategory";
import { EditCategory } from "../../CategoriesArea/EditCategory/EditCategory";
import { CategoryDetails } from "../../CategoriesArea/CategoryDetails/CategoryDetails";

// User Management
import { Users } from "../../UsersArea/Users/Users";
import { UserDetails } from "../../UsersArea/UserDetails/UserDetails";
import { Customers } from "../../UsersArea/Customers/Customers";
import { Employees } from "../../UsersArea/Employees/Employees";
import { UserProfile } from "../../UsersArea/UserProfile/UserProfile";
import { AdminCreateUser } from "../../UsersArea/AdminCreateUser/AdminCreateUser";

// Cart & Checkout
import { Cart } from "../../CartsArea/Cart/Cart";
import { Checkout } from "../../CartsArea/Checkout/Checkout";

// Orders
import { Orders } from "../../OrdersArea/Orders/Orders";
import { OrderDetails } from "../../OrdersArea/OrderDetails/OrderDetails";


export function Routing() {
    return (
        <div className="Routing">
            <Routes>
                {/* Public */}
                <Route path='/' element={<Navigate to='home' />} />
                <Route path='home' element={<Home />} />
                <Route path='about' element={<AboutUs />} />

                {/* Auth */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                {/* Products */}
                <Route path='products' element={<Products />} />
                <Route path='products/details/:prodId' element={<ProductDetails />} />
                <Route path='products/add' element={<AddProduct />} />
                {<Route path='products/edit/:prodId' element={<EditProduct />} /> }

                {/* Categories */}
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/add" element={<AddCategory />} />
                <Route path="/categories/edit/:id" element={<EditCategory />} />
                <Route path="/categories/details/:id" element={<CategoryDetails />} />

                {/* Cart & Checkout */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Orders */}
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />

                {/* User Management */}
                <Route path="/users" element={<Users />} />
                <Route path="/users/create" element={<AdminCreateUser />} />
                <Route path="/users/:id" element={<UserDetails />} />

                <Route path="/customers" element={<Customers />} />
                <Route path="/employees" element={<Employees />} />

                <Route path="/profile" element={<UserProfile />} />

                {/* 404 */}
                <Route path='/*' element={<NotFound />} />
            </Routes>
        </div>
    );
}