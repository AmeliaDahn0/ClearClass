export default function handler(req, res) {
  // In production, this data should come from a database or environment variable
  // For now, we'll return an empty array
  res.status(200).json([]);
} 