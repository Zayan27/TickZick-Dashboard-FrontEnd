import React, { useState, useCallback, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col } from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Checkbox } from '../../../../components/checkbox/checkbox';
import { DataService } from '../../../../config/dataService/dataService';
import { setItem, getItem } from '../../../../utility/localStorageControl';
import { ReactSVG } from 'react-svg';

function SignIn({ role }) {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [state, setState] = useState({ checked: null });

  useEffect(() => {
    const savedRole = getItem("auth_role");

    // Check token by role
    const adminToken = getItem("admin_token");
    const organizerToken = getItem("organizer_token");

    if (savedRole === "admin" && adminToken) {
      history("/admin", { replace: true });
    }

    else if (savedRole === "organizer" && organizerToken) {
      history("/organizer", { replace: true });
    }

  }, []);

  const handleGoogleLogin = () => {
    window.google.accounts.id.initialize({
      client_id: "1667228954-bvgnvamvq69vdec0tubu779u7on19jer.apps.googleusercontent.com",
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.prompt();
  };

  const handleGoogleResponse = async (response) => {
    const token = response.credential;
    const user = jwtDecode(token);

    try {
      const apiURL = role === "admin"
        ? "/admin/google-login"
        : "/organizer/google-login";

      const res = await DataService.post(apiURL, {
        name: user.name,
        email: user.email,
        provider: 'google',
        provider_id: user.sub,
      });

      if (res?.data?.success) {

        // Save login info
        if (role === "admin") {
          setItem("admin_token", res.data.token);
        } else {
          setItem("organizer_token", res.data.token);
        }

        setItem("auth_role", role);
        setItem("auth_user", role === "admin" ? res.data.admin : res.data.organizer);
        setItem("auth_success", true);

        const redirectTo = role === "admin" ? "/admin" : "/organizer";
        history(redirectTo, { replace: true });
      }

    } catch (err) {
      console.log("GOOGLE LOGIN ERROR:", err);
    }
  };

  const handleSubmit = useCallback(async (values) => {
    setLoading(true);

    try {
      // Dynamic URL based on role
      const apiURL = role === "admin"
        ? "/admin/login"
        : "/organizer/login";

      const res = await DataService.post(apiURL, values);

      if (res?.data?.success) {

        // Save login info
        if (role === "admin") {
          setItem("admin_token", res.data.token);
        } else {
          setItem("organizer_token", res.data.token);
        }
        setItem("auth_role", role);
        setItem("auth_user", role === 'admin' ? res.data.admin : res.data.organizer);
        setItem("auth_success", true);

        // Redirect
        const redirectTo = role === "admin" ? "/admin" : "/organizer";
        history(redirectTo);
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err);
    }

    setLoading(false);
  }, [role, history]);

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <div className="mt-6 bg-white rounded-md dark:bg-white10 shadow-regular dark:shadow-none">
          <div className="px-5 py-4 text-center border-b border-gray-200 dark:border-white10">
            <h2 className="mb-0 text-xl font-semibold text-dark dark:text-white87">Sign in</h2>
          </div>
          <div className="px-10 pt-8 pb-6">
            <Form name="login" form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="email"
                rules={[{ message: 'Please input your username or Email!', required: true }]}
                label="Username or Email Address"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
              >
                <Input placeholder="name@example.com" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
              <Form.Item
                name="remember"
                valuePropName="checked"
                initialValue={false}
              >
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <Checkbox onChange={onChange} checked={state.checked} className="text-xs text-light dark:text-white60">
                  Keep me logged in
                </Checkbox>
                <NavLink className=" text-primary text-13" to={`/auth/${role}/forgotPassword`}>
                  Forgot password?
                </NavLink>
              </div>
              </Form.Item>
              <Form.Item>
                <Button
                  className="w-full h-12 p-0 my-6 text-sm font-medium"
                  htmlType="submit"
                  type="primary"
                  size="large"
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </Button>
              </Form.Item>

              {role !== 'admin' && (
                <>
                  <p className="relative text-body dark:text-white60 -mt-2.5 mb-6 text-center text-13 font-medium before:absolute before:w-full before:h-px ltr:before:left-0 rtl:before:right-0 before:top-1/2 before:-translate-y-1/2 before:z-10 before:bg-gray-200 dark:before:bg-white10">
                    <span className="relative z-20 px-4 bg-white dark:bg-[#1b1d2a]">Or</span>
                  </p>
                  <ul className="flex items-center justify-center mb-0">
                    <li className="px-1.5 pt-3 pb-2.5">
                      <Link
                        to="#"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center h-12 px-4 rounded-md google-social group bg-google-plus-transparent hover:bg-google-plus text-google-plus hover:text-white"
                      >
                        <ReactSVG
                          className="[&>div>svg>path]:fill-google-plus group-hover:[&>div>svg>path]:fill-white"
                          src={require(`../../../../static/img/icon/google-plus.svg`).default}
                        />
                      </Link>
                    </li>
                  </ul>
                </>
              )}
            </Form>
          </div>
          {role === "organizer" && (
            <div className="p-6 text-center bg-gray-100 dark:bg-white10 rounded-b-md">
              <p className="mb-0 text-sm font-medium text-body dark:text-white60">
                Don`t have an account?
                <Link to={`/auth/organizer/register`} className="ltr:ml-1.5 rtl:mr-1.5 text-info hover:text-primary">
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
}

export default SignIn;
