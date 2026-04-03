import { UilAngleDown, UilLock, UilSignout, UilUser } from '@iconscout/react-unicons';
import { Avatar } from 'antd';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Search from './Search';
import Message from './Message';
import Notification from './Notification';
import Settings from './settings';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import { Dropdown } from '../../dropdown/dropdown';
import { getItem, removeItem } from '../../../utility/localStorageControl';
import { DataService } from "../../../config/dataService/dataService";

const AuthInfo = React.memo(() => {
  const [state, setState] = useState({
    flag: 'en',
    user: null,
    role: 'admin',
    loading: false
  });
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { flag, user, role, loading } = state;

  // Get user data and role from cookies on component mount
  useEffect(() => {
    const authUser = getItem('auth_user');
    const authRole = getItem('auth_role');
    debugger;
    setState(prev => ({
      ...prev,
      user: authUser,
      role: authRole
    }));
    console.log(state)
  }, []);

  const SignOut = async () => {

    setState(prev => ({ ...prev, loading: true }));

    try {
      await DataService.post(`${role}/logout`, {});

    } catch (error) {
      console.log("Logout API error ignored:", error);
    }

    // Always clear session even if API fails
    removeItem('auth_user');
    removeItem('auth_role');
    removeItem('admin_token');
    removeItem('organizer_token');
    removeItem('auth_success');

    navigate("/", { replace: true });

    setState(prev => ({ ...prev, loading: false }));
  };

  const userContent = (
    <div>
      <div className="min-w-[280px] sm:min-w-full pt-4">
        <figure className="flex items-center text-sm rounded-[8px] bg-section dark:bg-white10 py-[20px] px-[25px] mb-[12px]">
          <Avatar
            src={user?.image || user?.photo || "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"}
            size={48}
            className="ltr:mr-4 rtl:ml-4"
          />
          <figcaption>
            <Heading className="text-dark dark:text-white87 mb-0.5 text-sm" as="h5">
              {user?.name
                || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null)
                || user?.username
                || 'User'
              }
            </Heading>
            <p className="mb-0 text-xs text-body dark:text-white60">
              {role === 'organizer' ? 'Organizer' : 'Administrator'}
            </p>
            <p className="mb-0 text-xs text-light dark:text-white60 mt-1">
              {user?.email || ''}
            </p>
          </figcaption>
        </figure>
        <ul className="mb-0">
          <li>
            <Link
              to={`/${role}/profile/edit`}
              className="inline-flex items-center hover:bg-shadow-transparent text-light dark:text-white60 dark:hover:text-white hover:text-primary dark:hover:bg-white10 dark:rounded-4 hover:pl-6 w-full px-2.5 py-3 text-sm transition-all ease-in-out delay-150"
            >
              <UilUser className="w-4 h-4 ltr:mr-3 rtl:ml-3" /> Profile
            </Link>
          </li>
          <li>
            <Link
              to={`/${role}/profile/change-password`}
              className="inline-flex items-center hover:bg-shadow-transparent text-light dark:text-white60 dark:hover:text-white hover:text-primary dark:hover:bg-white10 dark:rounded-4 hover:pl-6 w-full px-2.5 py-3 text-sm transition-all ease-in-out delay-150"
            >
              <UilLock className="w-4 h-4 ltr:mr-3 rtl:ml-3" /> Change Password
            </Link>
          </li>
        </ul>
        <Link
          to="#"
          onClick={SignOut}
          disabled={loading}
          className={`flex items-center justify-center text-sm font-medium bg-[#f4f5f7] dark:bg-[#32333f] h-[50px] text-light hover:text-primary dark:hover:text-white60 dark:text-white87 mx-[-15px] mb-[-15px] rounded-b-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ltr:mr-3 rtl:ml-3"></span>
              Logging out...
            </>
          ) : (
            <>
              <UilSignout className="w-4 h-4 ltr:mr-3 rtl:ml-3" /> Sign Out
            </>
          )}
        </Link>
      </div>
    </div>
  );

  const onFlagChangeHandle = (value, e) => {
    e.preventDefault();
    setState({
      ...state,
      flag: value,
    });
    i18n.changeLanguage(value);
  };

  const country = (
    <div className="block bg-white dark:bg-[#1b1d2a]">
      <Link
        to="#"
        onClick={(e) => onFlagChangeHandle('en', e)}
        className="flex items-center bg-white dark:bg-white10 hover:bg-primary-transparent px-3 py-1.5 text-sm text-dark dark:text-white60"
      >
        <img className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" src={require('../../../static/img/flag/en.png')} alt="" />
        <span>English</span>
      </Link>
      <Link
        to="#"
        onClick={(e) => onFlagChangeHandle('en', e)}
        className="flex items-center bg-white dark:bg-white10 hover:bg-primary-transparent px-3 py-1.5 text-sm text-dark dark:text-white60"
      >
        <img className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" src={require('../../../static/img/flag/esp.png')} alt="" />
        <span>Spanish</span>
      </Link>
      <Link
        to="#"
        onClick={(e) => onFlagChangeHandle('en', e)}
        className="flex items-center bg-white dark:bg-white10 hover:bg-primary-transparent px-3 py-1.5 text-sm text-dark dark:text-white60"
      >
        <img className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" src={require('../../../static/img/flag/ar.png')} alt="" />
        <span>Arabic</span>
      </Link>
    </div>
  );

  // If user data is not loaded yet, show a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-end flex-auto">
        <div className="md:hidden">
          <Search />
        </div>
        <Message />
        <Notification />
        <Settings />
        <div className="flex mx-3">
          <Dropdown placement="bottomRight" content={country} trigger="click">
            <Link to="#" className="flex">
              <img src={require(`../../../static/img/flag/${flag}.png`)} alt="" />
            </Link>
          </Dropdown>
        </div>
        <div className="flex ltr:ml-3 rtl:mr-3 ltr:mr-4 rtl:ml-4 ssm:mr-0 ssm:rtl:ml-0">
          <Avatar src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end flex-auto">
      <div className="md:hidden">
        <Search />
      </div>
      <Message />
      <Notification />
      <Settings />
      <div className="flex mx-3">
        <Dropdown placement="bottomRight" content={country} trigger="click">
          <Link to="#" className="flex">
            <img src={require(`../../../static/img/flag/${flag}.png`)} alt="" />
          </Link>
        </Dropdown>
      </div>
      <div className="flex ltr:ml-3 rtl:mr-3 ltr:mr-4 rtl:ml-4 ssm:mr-0 ssm:rtl:ml-0">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="flex items-center text-light whitespace-nowrap">
            <Avatar
              src={user?.image || user?.photo || "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"}
              alt={user?.username}
            />
            <span className="ltr:mr-1.5 rtl:ml-1.5 ltr:ml-2.5 rtl:mr-2.5 text-body dark:text-white60 text-sm font-medium md:hidden">
              {user?.name
                || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null)
                || user?.username
                || 'User'
              }
            </span>
            <UilAngleDown className="w-4 h-4 ltr:md:ml-[5px] rtl:md:mr-[5px]" />
          </Link>
        </Popover>
      </div>
    </div>
  );
});

export default AuthInfo;