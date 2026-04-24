import { Box } from '@chakra-ui/react';

const AuthHeader: React.FC = () => (
  <Box
    h="74px"
    w="full"
    bg="white.core"
    display="flex"
    alignItems="center"
    pl="26px"
    flexShrink={0}
  >
    <Box w="40px" h="40px">
      <img
        src="/favicon.ico"
        alt="SSF"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </Box>
  </Box>
);

export default AuthHeader;
