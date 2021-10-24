import { setAdminPage } from "app/slice/pageSlice";
import store from "app/store";
import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import TopBar from "./adminpage/layout/TopBar";
import Sidebar from 'components/adminpage/layout/SideBar';
import AdminHome from 'components/adminpage/content/adminHome/AdminHome';
import UserList from 'components/adminpage/content/UserList';
import VehicleList from './adminpage/content/VehicleList';
import TransactionList from './adminpage/content/TransactionList';
const AdminRoute = () => {
  // @ts-ignore
  const token = useSelector((state) => state.logged);
  // @ts-ignore
  const isAdmin = useSelector((state) => state.isAdmin).status;
  if (!isAdmin) {
    store.dispatch(setAdminPage());
  }
  return (
    // <div className="adminPage">
    //   <TopBar />
    //   <div className="adminPageContainer fuild">
    //     <Sidebar />
    //     <Route
    //       {...rest}
    //       exact
    //       render={(props) =>
    //         token.data && token.data.role === "ROLE_ADMIN" ? (
    //           <div>{React.createElement(component, props)}</div>
    //         ) : (
    //           <Redirect
    //             to={{
    //               pathname: "/",
    //               state: { from: props.location },
    //             }}
    //           />
    //         )
    //       }
    //     />
    //   </div>
// vkl liôn
    // </div>
    <div>
      <Redirect exact from="/" to="/admin" />
      <Route path="/admin" render={({ match: { url } }) => (
        <div className="adminPage">
          <TopBar />
          <div className="adminPageContainer fuild">
            <Sidebar />
            <Switch>
              <Route exact path={`${url}/`} component={AdminHome} />
              <Route path={`${url}/users`} component={UserList} />
              <Route path={`${url}/vehicles`} component={VehicleList} />
              {/* <Route path={`${url}/transactions`} component={TransactionList} /> */}
            </Switch>
          </div>
        </div>
      )} />
    </div>
  );
};
export default React.memo(AdminRoute);
