#!/bin/bash
echo "Fichiers avec params non-Promise:"
grep -r "params: {" app/ --include="*.ts" --include="*.tsx"