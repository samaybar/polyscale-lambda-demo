STACK_NAME=polyscale-demo
BUCKET_NAME=polyscale-lambda-demo
STACK_NAME_SERVERLESS=polyscale-demo-serverless
BUCKET_NAME_SERVERLESS=polyscale-lambda-demo-serverless
REGION=us-west-2

.PHONY: deploy

bucket:
	aws s3 mb s3://$(BUCKET_NAME) --region $(REGION)

deploy: node_modules
	sam package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket $(BUCKET_NAME)
	sam deploy --template-file packaged.yaml --stack-name $(STACK_NAME) --capabilities CAPABILITY_IAM --region $(REGION)

node_modules:
	npm install --prefix database

destroy:
	aws cloudformation delete-stack --stack-name $(STACK_NAME) --region $(REGION)
	aws s3 rb s3://$(BUCKET_NAME) --force --region $(REGION)

bucket-serverless:
	aws s3 mb s3://$(BUCKET_NAME_SERVERLESS) --region $(REGION)

deploy-serverless: node_modules_serverless
	sam package --template-file template-serverless.yaml --output-template-file packaged-serverless.yaml --s3-bucket $(BUCKET_NAME_SERVERLESS)
	sam deploy --template-file packaged-serverless.yaml --stack-name $(STACK_NAME_SERVERLESS) --capabilities CAPABILITY_IAM --region $(REGION)

node_modules_serverless:
	npm install --prefix database-serverless

destroy-serverless:
	aws cloudformation delete-stack --stack-name $(STACK_NAME_SERVERLESS) --region $(REGION)
	aws s3 rb s3://$(BUCKET_NAME_SERVERLESS) --force --region $(REGION)