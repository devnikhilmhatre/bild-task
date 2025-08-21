// src/pages/SignUp.tsx
import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const { mutate, status } = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      const res = await axios.post('/users', values);
      return res.data;
    },
    onSuccess: () => {
      message.success('Account created! Please login.');
      navigate('/login');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Signup failed');
    },
  });

  const onFinish = (values: SignUpFormValues) => {
    mutate(values);
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Sign Up
      </Title>
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="example@email.com" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password placeholder="********" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={status === 'pending'}
          >
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUp;
