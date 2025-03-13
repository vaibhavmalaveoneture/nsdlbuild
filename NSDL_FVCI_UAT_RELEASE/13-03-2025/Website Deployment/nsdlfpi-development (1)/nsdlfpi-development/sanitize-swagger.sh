# Add override in src/api/encoder
# Replace occurrences of 'encodeKey(k:' with 'override encodeKey(k:'
find ./src/swagger -type f -name "encoder.ts" -exec sed -i 's/encodeKey(k:/override encodeKey(k:/g' {} +

# Replace occurrences of 'encodeValue(v:' with 'override encodeValue(v:'
find ./src/swagger -type f -name "encoder.ts" -exec sed -i 's/encodeValue(v:/override encodeValue(v:/g' {} +
