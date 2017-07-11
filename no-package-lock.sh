# hasta la vista baby!
file="package-lock.json"
if [ -f "$file" ]
then
  rm $file
  echo "$file was successfully removed 🔫!"
else
  echo "No $file found 🙃️!"

fi