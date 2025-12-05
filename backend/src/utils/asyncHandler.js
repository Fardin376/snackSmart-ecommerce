const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`${fn.name} error:`, error);

    if (error.errors) {
      // Handle Zod validation errors
      return res.status(400).json({ errors: error.errors.map((e) => e.message) });
    }

    res.status(500).json({ message: 'Server error' });
  });
};

export default asyncHandler;