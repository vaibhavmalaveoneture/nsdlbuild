# Re Generates the client library in the frontend project

java -jar ./swagger-codegen-cli.jar generate -i http://localhost:3000/swagger/v1/swagger.json -l typescript-angular -o ./src/swagger --api-package "nsdlfpi" --additional-properties ngVersion=19.1.6,providedInRoot=true,supportsES6=true,modelPropertyNaming=original,npmName="nsdl",sortParamsByRequiredFlag=true

./sanitize-swagger.sh