import { Box } from '@chakra-ui/react';
import loginBackground from '../assets/login_background.png';
import ResetPasswordModal from '@components/forms/resetPasswordModal';

const ForgotPasswordPage: React.FC = () => {
  return (
    <Box
      minH="100vh"
      w="full"
      bgImage={`url(${loginBackground})`}
      bgSize="cover"
      bgPos="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <ResetPasswordModal></ResetPasswordModal>
    </Box>
  );
};

export default ForgotPasswordPage;
