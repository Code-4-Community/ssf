import ApiClient from '@api/apiClient';
import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Flex,
  Input,
  InputGroup,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useAlert } from '../../hooks/alert';
import { useEffect, useState } from 'react';
import { ApprovedPantryResponse, Assignments } from 'types/types';
import { SearchIcon } from 'lucide-react';
import { getInitials, USER_ICON_COLORS } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface AssignVolunteersModalProps {
  pantry: ApprovedPantryResponse;
  onSuccess: () => void;
  onClose: () => void;
  isOpen: boolean;
}

type VolunteerDisplay = {
  userId: number;
  firstName: string;
  lastName: string;
};

const AssignVolunteersModal: React.FC<AssignVolunteersModalProps> = ({
  pantry,
  onSuccess,
  onClose,
  isOpen,
}) => {
  useModalBodyCleanup();
  const [alertState, setAlertMessage] = useAlert();

  const [volunteers, setVolunteers] = useState<VolunteerDisplay[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [searchName, setSearchName] = useState<string>('');

  const handleSearchNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchName(event.target.value);
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchVolunteers = async () => {
      try {
        const allVolunteers: Assignments[] = await ApiClient.getVolunteers();

        const assignedIds = new Set(pantry.volunteers.map((v) => v.userId));

        const normalized: VolunteerDisplay[] = allVolunteers.map((v) => ({
          userId: v.id,
          firstName: v.firstName,
          lastName: v.lastName,
        }));

        setVolunteers(normalized);
        setSelectedIds(new Set(assignedIds));
      } catch {
        setAlertMessage('Error fetching volunteers');
      }
    };

    fetchVolunteers();
  }, [pantry, setAlertMessage, isOpen]);

  const filteredVolunteers = volunteers.filter((v) => {
    const fullName = `${v.firstName} ${v.lastName}`.toLowerCase();
    return fullName.includes(searchName.toLowerCase());
  });

  const handleToggle = (userId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(userId);
      else next.delete(userId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const originalIds = new Set(pantry.volunteers.map((v) => v.userId));

      const addVolunteerIds = [...selectedIds].filter(
        (id) => !originalIds.has(id),
      );
      const removeVolunteerIds = [...originalIds].filter(
        (id) => !selectedIds.has(id),
      );

      if (addVolunteerIds.length > 0 || removeVolunteerIds.length > 0) {
        await ApiClient.updatePantryVolunteers(pantry.pantryId, {
          addVolunteerIds,
          removeVolunteerIds,
        });
      }

      onSuccess();
      onClose();
    } catch {
      setAlertMessage('Error saving volunteer assignments');
    }
  };

  return (
    <Dialog.Root
      size="md"
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton
              color="var(--chakra-colors-neutral-700)"
              size="md"
              mt={3}
            />
          </Dialog.CloseTrigger>

          <Dialog.Header pb={0}>
            <Dialog.Title
              fontSize="18px"
              fontFamily="inter"
              fontWeight={600}
              color="black"
              mt={3}
            >
              Assign Volunteers
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body pb={6}>
            <VStack align="stretch" gap={4}>
              <Text textStyle="p2" color="gray.dark">
                {pantry.pantryName}
              </Text>
              <VStack align="stretch" gap={8} mt={6}>
                <InputGroup
                  startElement={
                    <Box>
                      <SearchIcon
                        color="var(--chakra-colors-neutral-600)"
                        size={13}
                        strokeWidth={3}
                      />
                    </Box>
                  }
                  px={3}
                >
                  <Input
                    placeholder="Search"
                    value={searchName}
                    borderColor="neutral.100"
                    ps="8"
                    onChange={handleSearchNameChange}
                    color="neutral.600"
                    textStyle="p2"
                    _focusVisible={{ boxShadow: 'none', outline: 'none' }}
                  />
                </InputGroup>
                <Box maxH="300px" overflowY="auto" px={3}>
                  <VStack align="stretch" gap={0}>
                    {filteredVolunteers.map((volunteer) => (
                      <Flex
                        key={volunteer.userId}
                        align="center"
                        justify="space-between"
                        borderBottom="1px solid"
                        borderColor="neutral.100"
                      >
                        <Flex align="center" gap={3} py={2}>
                          <Box
                            borderRadius="full"
                            bg={
                              USER_ICON_COLORS[
                                volunteer.userId % USER_ICON_COLORS.length
                              ]
                            }
                            width="33px"
                            height="33px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontSize="12px"
                            flexShrink={0}
                          >
                            {getInitials(
                              volunteer.firstName,
                              volunteer.lastName,
                            )}
                          </Box>

                          <Text color="neutral.700" textStyle="p2">
                            {volunteer.firstName} {volunteer.lastName}
                          </Text>
                        </Flex>

                        <Box
                          borderLeft="1px solid"
                          borderColor="neutral.100"
                          pl={4}
                          alignSelf="stretch"
                          display="flex"
                          alignItems="center"
                        >
                          <Checkbox.Root
                            checked={selectedIds.has(volunteer.userId)}
                            onCheckedChange={(e: { checked: boolean }) =>
                              handleToggle(volunteer.userId, e.checked)
                            }
                            size="md"
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control
                              borderRadius="2px"
                              borderColor="neutral.100"
                            />
                          </Checkbox.Root>
                        </Box>
                      </Flex>
                    ))}

                    {filteredVolunteers.length === 0 && (
                      <Text
                        color="neutral.500"
                        fontSize="14px"
                        textAlign="center"
                        py={4}
                      >
                        No volunteers found
                      </Text>
                    )}
                  </VStack>
                </Box>
                <Box w="100%" display="flex" justifyContent="flex-end">
                  <Button
                    bg="blue.core"
                    color="white"
                    fontWeight={600}
                    onClick={handleSave}
                    px={10}
                  >
                    Save Changes
                  </Button>
                </Box>
              </VStack>
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default AssignVolunteersModal;
