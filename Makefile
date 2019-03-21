build:
	npm install
	npm test
	npm run build

deploy: build
	aws cloudformation package --template-file template.yaml --s3-bucket $(shell aws sts get-caller-identity --query Account --output text)-sam-deploy-eu-west-1 --s3-prefix thundra-test --output-template-file packaged.yaml --region eu-west-1
	aws cloudformation deploy --template-file packaged.yaml --stack-name thundra-demo --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --region eu-west-1

show-function-name:
	aws cloudformation describe-stack-resource --stack-name thundra-demo --logical-resource-id SkillFunction --region eu-west-1 --query "StackResourceDetail.PhysicalResourceId" --output text