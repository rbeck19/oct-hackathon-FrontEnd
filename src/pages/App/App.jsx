
import React, { useState, Fragment, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import Navbar from '../../components/Navbar/Navbar';
import AutoDismissAlert from '../../components/shared/AutoDismissAlert/AutoDismissAlert';
import RequireAuth from '../../components/shared/RequireAuth';
import Home from '../HomePage/Home';
import SignUp from '../../components/auth/SignUp';
import SignIn from '../../components/auth/SignIn';
import SignOut from '../../components/auth/SignOut';
import ChangePassword from '../../components/auth/ChangePassword';
import DetailPage from '../DetailPage/DetailPage';
import IndexPage from '../Business/IndexPage'
import './App.css';
import { getbusinesses } from '../../api/yelp_api';


const App = () => {

  const [user, setUser] = useState(null);
  const [msgAlerts, setMsgAlerts] = useState([]);
  const [data, setData] = useState([]);
  const [location, setLocation] = useState('LA');
  const [price, setPrice] = useState(1);
  const [category, setCategory] = useState('Food');
  const [radius, setRadius] = useState(8000);
  const currentLocation = useLocation();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');

    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }

    getbusinesses(location, price, category, radius)
      .then((res) => {
        console.log(res.data.businesses);
        setData(res.data.businesses);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [location, price, category, radius]);

  const clearUser = () => {
    setUser(null);
  };

  const deleteAlert = (id) => {
    setMsgAlerts((prevState) => {
      return prevState.filter((msg) => msg.id !== id);
    });
  };

  const msgAlert = ({ heading, message, variant }) => {
    const id = uuid();
    setMsgAlerts((prevState) => {
      return [...prevState, { heading, message, variant, id }];
    });
  };

  const shouldRenderNavbar = !['/sign-in', '/sign-up'].includes(currentLocation.pathname);


  return (
    <Fragment>
	<header className='header'><h2>Pl<span className='headerRed'>a</span>teP<span className='headerRed'>i</span>lot</h2></header>

      {shouldRenderNavbar && (
        <Navbar
          location={location}
          setLocation={setLocation}
          price={price}
          setPrice={setPrice}
          category={category}
          setCategory={setCategory}
          user={user}
          radius={radius}
          setRadius={setRadius}
        />
      )}

      <Routes>
        <Route
          path='/'
          element={<Home msgAlert={msgAlert} user={user} data={data} />}
        />
        <Route
          path='/sign-up'
          element={<SignUp msgAlert={msgAlert} setUser={setUser} />}
        />
        <Route
          path='/sign-in'
          element={<SignIn msgAlert={msgAlert} setUser={setUser} />}
        />
        <Route
          path='/sign-out'
          element={
            <RequireAuth user={user}>
              <SignOut msgAlert={msgAlert} clearUser={clearUser} user={user} />
            </RequireAuth>
          }
        />
        <Route
          path='/change-password'
          element={
            <RequireAuth user={user}>
              <ChangePassword msgAlert={msgAlert} user={user} />
            </RequireAuth>
          }
        />
        <Route path='/:dataId' element={<DetailPage data={data} />} />
        <Route path='/favorites' element={<IndexPage msgAlert={msgAlert} user={user} />} />
      </Routes>

      {msgAlerts.map((msgAlert) => (
        <AutoDismissAlert
          key={msgAlert.id}
          heading={msgAlert.heading}
          variant={msgAlert.variant}
          message={msgAlert.message}
          id={msgAlert.id}
          deleteAlert={deleteAlert}
        />
      ))}
    </Fragment>
  );
};

export default App;