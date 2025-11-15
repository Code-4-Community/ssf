export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
};

export const formatReceivedDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date
    .toISOString()
    .split('T')[0]
    .replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1');
};
