import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { Row, Col, Form, Input, Button, Select, Checkbox } from 'antd';

import { AuthFormWrap } from './style';
import { DataService } from '../../../../config/dataService/dataService';
import { setItem, getItem } from '../../../../utility/localStorageControl';


function SignUp() {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const savedRole = getItem("auth_role");

    // Check token by role
    const adminToken = getItem("admin_token");
    const organizerToken = getItem("organizer_token");

    // If ROLE EXISTS → check its correct token
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
      const res = await DataService.post("/organizer/google-register", {
        name: user.name,
        email: user.email,
        provider: 'google',
        provider_id: user.sub,
      });

      if (res?.data?.success) {
        setItem("organizer_token", res.data.token);
        setItem("auth_role", role);
        setItem("auth_user", role === "admin" ? res.data.admin : res.data.organizer);
        setItem("auth_success", true);

        history("/organizer", { replace: true });
      }

    } catch (err) {
      console.log("GOOGLE LOGIN ERROR:", err);
    }
  };

  const handleSubmit = useCallback(async (values) => {
    if (!agree) {
      alert("You must agree to terms!");
      return;
    }

    setLoading(true);

    try {
      const res = await DataService.post("/organizer/register", values);

      if (res?.data?.success) {

        // Save Login Info
        if (role === "admin") {
          setItem("admin_token", res.data.token);
        } else {
          setItem("organizer_token", res.data.token);
        }
        setItem("auth_role", "organizer");
        setItem("auth_user", res.data.user);
        setItem("auth_success", true);

        // Redirect to organizer dashboard
        history("/organizer");
      }

    } catch (err) {
      console.log("REGISTER ERROR:", err);
    }

    setLoading(false);
  }, [agree, history]);

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap className="mt-6 bg-white rounded-md dark:bg-white10 shadow-regular dark:shadow-none">
          <div className="px-5 py-4 text-center border-b border-gray-200 dark:border-white10">
            <h2 className="mb-0 text-xl font-semibold text-dark dark:text-white87">Sign Up</h2>
          </div>
          <div className="px-10 pt-8 pb-6">
            <Form form={form} name="register" onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="organizer_type"
                label="Account Type"
                rules={[{ required: true, message: "Please select account type!" }]}
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
              >
                <Select placeholder="Select account type">
                  <Option value="company">Company</Option>
                  <Option value="individual">Individual</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Name"
                name="organizer_name"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
                rules={[{ required: true, message: 'Please input your Full name!' }]}
              >
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item
                label="Username"
                name="username"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
                rules={[{ required: true, message: 'Please input username!' }]}
              >
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email Address"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
                rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
              >
                <Input placeholder="name@example.com" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white60 [&>div>div>label]:font-medium"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
              <div className="flex items-center justify-between">
                <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                  Creating an account means you’re okay with our Terms of Service and Privacy Policy
                </Checkbox>
              </div>
              <Form.Item>
                <Button
                  className="w-full h-12 p-0 my-6 text-sm font-medium"
                  htmlType="submit"
                  type="primary"
                  size="large"
                >
                  {loading ? 'Loading...' : 'Create Account'}
                </Button>
              </Form.Item>
              <p className="relative text-body dark:text-white60 -mt-2.5 mb-6 text-center text-13 font-medium before:absolute before:w-full before:h-px ltr:before:left-0 rtl:before:right-0 before:top-1/2 before:-translate-y-1/2 before:z-10 before:bg-gray-200 dark:before:bg-white10">
                <span className="relative z-20 px-4 bg-white dark:bg-[#1b1d2a]">Or</span>
              </p>
              <ul className="flex items-center justify-center mb-0">
                <li className="px-1.5 pt-3 pb-2.5">
                  <Link
                    to="#"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center h-12 px-4 rounded-md google-social bg-google-plus-transparent hover:bg-google-plus text-google-plus hover:text-white"
                  >
                    <ReactSVG
                      className="[&>div>svg>path]:fill-google-plus group-hover:[&>div>svg>path]:fill-white"
                      src={require(`../../../../static/img/icon/google-plus.svg`).default}
                    />
                  </Link>
                </li>
              </ul>
            </Form>
          </div>
          <div className="p-6 text-center bg-gray-100 dark:bg-white10 rounded-b-md">
            <p className="mb-0 text-sm font-medium text-body dark:text-white60">
              Already have an account?
              <Link to={`auth/organizer/login`} className="ltr:ml-1.5 rtl:mr-1.5 text-info hover:text-primary">
                Sign In
              </Link>
            </p>
          </div>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default SignUp;
