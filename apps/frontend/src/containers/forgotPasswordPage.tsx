import { Box } from '@chakra-ui/react';
import loginBackground from '../assets/login_background.png';
import ResetPasswordModal from '@components/forms/resetPasswordModal';
import AuthHeader from '@components/AuthHeader';

const ForgotPasswordPage: React.FC = () => {
  return (
    <Box minH="100vh" w="full" display="flex" flexDirection="column">
      <AuthHeader />
      <Box
        flex={1}
        bgImage={`url(${loginBackground})`}
        bgSize="cover"
        bgPos="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <ResetPasswordModal />
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
