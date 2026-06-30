import { useEffect, useState } from 'react';
import {
  Table,
  Text,
  Flex,
  Input,
  VStack,
  Box,
  Pagination,
  ButtonGroup,
  IconButton,
  Link,
  Button,
  Checkbox,
  Badge,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Funnel, Search } from 'lucide-react';
import { AlertStatus, FoodManufacturer } from '../types/types';
import { DonateWastedFood } from '../types/manufacturerEnums';
import ApiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../hooks/alert';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

const AdminFoodManufacturerManagement: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [foodManufacturers, setFoodManufacturers] = useState<
    FoodManufacturer[]
  >([]);

  const [searchFM, setSearchFM] = useState('');
  const [selectedFMs, setSelectedFMs] = useState<string[]>([]);

  const [alertState, setAlertMessage] = useAlert();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pageSize = 10;

  const fetchFoodManufacturers = async () => {
    try {
      const approved = await ApiClient.getApprovedFoodManufacturers();
      setFoodManufacturers(approved);
    } catch {
      setAlertMessage('Error fetching food manufacturers', AlertStatus.ERROR);
    }
  };

  useEffect(() => {
    fetchFoodManufacturers();
  }, [setAlertMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFMs]);

  const fmOptions = [
    ...new Set(foodManufacturers.map((fm) => fm.foodManufacturerName)),
  ].sort((a, b) => a.localeCompare(b));

  const handleFilterChange = (fm: string, checked: boolean) => {
    if (checked) {
      setSelectedFMs([...selectedFMs, fm]);
    } else {
      setSelectedFMs(selectedFMs.filter((f) => f !== fm));
    }
  };

  const filteredFMs = foodManufacturers.filter((fm) => {
    const matchesFilter =
      selectedFMs.length === 0 || selectedFMs.includes(fm.foodManufacturerName);
    return matchesFilter;
  });

  const paginatedFMs = filteredFMs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const textHeaderStyles = {
    color: 'neutral.800',
    textStyle: 'p2',
    fontWeight: '600',
    fontFamily: 'inter',
  };

  return (
    <Box flexDirection="column" p={12}>
      <Text textStyle="h1" color="gray.light">
        Manufacturer Management
      </Text>
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}

      <Box
        mt={3}
        display="block"
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        whiteSpace="nowrap"
      >
        <VStack mt={2} mb={7} align="start">
          <Flex
            justify="space-between"
            align="center"
            w="100%"
            position="relative"
          >
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              color="neutral.800"
              border="1px solid"
              borderColor="neutral.200"
              size="sm"
              p={3}
              fontFamily="ibm"
              fontWeight="semibold"
            >
              <Funnel />
              Filter
            </Button>
            {isFilterOpen && (
              <>
                <Box
                  position="fixed"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  onClick={() => setIsFilterOpen(false)}
                  zIndex={10}
                />
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  mt={2}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="lg"
                  p={4}
                  minW="275px"
                  maxH="200px"
                  overflowY="auto"
                  zIndex={20}
                >
                  <Box position="relative" mb={1} pl={0} ml={-2} mt={-2}>
                    <Search
                      size={18}
                      color="var(--chakra-colors-neutral-300)"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 8,
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <Input
                      placeholder="Search"
                      color={searchFM ? 'neutral.800' : 'neutral.300'}
                      value={searchFM}
                      onChange={(e) => setSearchFM(e.target.value)}
                      fontSize="sm"
                      pl="30px"
                      border="none"
                      bg="transparent"
                      _focus={{
                        boxShadow: 'none',
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                  </Box>
                  <VStack align="stretch" gap={2}>
                    {fmOptions
                      .filter((fm) =>
                        fm.toLowerCase().includes(searchFM.toLowerCase()),
                      )
                      .map((fm) => (
                        <Checkbox.Root
                          key={fm}
                          checked={selectedFMs.includes(fm)}
                          onCheckedChange={(e: { checked: boolean }) =>
                            handleFilterChange(fm, e.checked)
                          }
                          color="gray.dark"
                          size="md"
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control borderRadius="sm" />
                          <Checkbox.Label>{fm}</Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                  </VStack>
                </Box>
              </>
            )}
          </Flex>
        </VStack>
        <Table.Root variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader {...textHeaderStyles}>
                Food Manufacturer
              </Table.ColumnHeader>
              <Table.ColumnHeader {...textHeaderStyles}>
                Food Rescue
              </Table.ColumnHeader>
              <Table.ColumnHeader {...textHeaderStyles} textAlign="right">
                Action
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body
            color="neutral.700"
            fontWeight={400}
            textStyle="p2"
            css={{ '& td': { paddingTop: '8px', paddingBottom: '8px' } }}
          >
            {paginatedFMs?.map((fm) => (
              <Table.Row key={fm.foodManufacturerId}>
                <Table.Cell>
                  <Link
                    textStyle="p2"
                    color="gray.dark"
                    variant="underline"
                    textDecorationColor="gray.dark"
                    onClick={() =>
                      navigate(
                        ROUTES.FOOD_MANUFACTURER_MANAGEMENT_DETAILS.replace(
                          ':foodManufacturerId',
                          fm.foodManufacturerId.toString(),
                        ),
                      )
                    }
                  >
                    {fm.foodManufacturerName}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    py={1}
                    px={2}
                    color="neutral.800"
                    textStyle="p2"
                    fontWeight={500}
                    fontSize="12px"
                    bgColor={
                      fm.donateWastedFood === DonateWastedFood.NEVER
                        ? 'neutral.200'
                        : 'neutral.100'
                    }
                  >
                    {fm.donateWastedFood === DonateWastedFood.ALWAYS
                      ? 'Yes'
                      : fm.donateWastedFood === DonateWastedFood.SOMETIMES
                      ? 'Sometimes'
                      : 'No'}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Link
                    color="neutral.700"
                    fontWeight={400}
                    textStyle="p2"
                    variant="underline"
                    textDecorationColor="neutral.700"
                    cursor="pointer"
                    onClick={() => navigate(ROUTES.ADMIN_DONATION)}
                  >
                    View Donations
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Flex justify="center" mt={12}>
          <Pagination.Root
            count={Math.ceil(filteredFMs.length / pageSize)}
            pageSize={1}
            page={currentPage}
            onChange={(page: number) => setCurrentPage(page)}
          >
            <ButtonGroup variant="outline" size="sm" gap={4}>
              <Pagination.PrevTrigger asChild>
                <IconButton
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  <ChevronLeft />
                </IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    borderColor={{
                      base: 'neutral.100',
                      _selected: 'neutral.600',
                    }}
                    variant={{ base: 'outline', _selected: 'outline' }}
                    onClick={() => setCurrentPage(page.value)}
                  >
                    {page.value}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton
                  variant="ghost"
                  disabled={
                    currentPage === Math.ceil(filteredFMs.length / pageSize)
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(filteredFMs.length / pageSize),
                      ),
                    )
                  }
                >
                  <ChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </Flex>
      </Box>
    </Box>
  );
};

export default AdminFoodManufacturerManagement;
