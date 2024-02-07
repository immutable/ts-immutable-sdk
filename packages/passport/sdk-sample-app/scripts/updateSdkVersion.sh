if [[ "$OSTYPE" == "darwin"* ]]; then
sed -i '' "s/__SDK_VERSION__/$(git describe --tags --abbrev=0)/g" $1
else
sed -i "s/__SDK_VERSION__/$(git describe --tags --abbrev=0)/g" $1
i
