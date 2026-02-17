import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Row, Col } from 'antd';
import { AuthFormWrap } from './style';
import { setItem, getItem } from '../../../../utility/localStorageControl';

function ForgotPassword({ role }) {
  const [state, setState] = useState({
    values: null,
  });

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

  const handleSubmit = (values) => {
    setState({ ...state, values });
  };

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap className="mt-6 bg-white rounded-md dark:bg-white10 shadow-regular dark:shadow-none">
          <Form name="forgotPass" onFinish={handleSubmit} layout="vertical">
            <div className="px-5 py-4 text-center border-b border-gray-200 dark:border-white10">
              <h2 className="mb-0 text-xl font-semibold text-dark dark:text-white87">Forgot Password?</h2>
            </div>
            <div className="px-10 pt-8 pb-6">
              <p className="mb-4 dark:text-white60">
                Enter the email address you used when you joined and we’ll send you instructions to reset your password.
              </p>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
              >
                <Input placeholder="name@example.com" />
              </Form.Item>
              <Form.Item>
                <Button
                  className="block w-full h-12 p-0 text-sm font-medium"
                  htmlType="submit"
                  type="primary"
                  size="large"
                >
                  Send Reset Instructions
                </Button>
              </Form.Item>
            </div>
            <div className="p-6 text-center bg-section dark:bg-white10 rounded-b-md">
              <p className="mb-0 text-sm font-medium text-body dark:text-white60">
                Return to
                <Link to={`/auth/${role}/login`} className="ltr:ml-1.5 rtl:mr-1.5 text-info hover:text-primary">
                  Sign In
                </Link>
              </p>
            </div>
          </Form>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default ForgotPassword;
