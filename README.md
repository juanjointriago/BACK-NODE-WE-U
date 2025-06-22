# WE-U BACKEND PROJECT

# Iniciar tsc

tsc --init
config:

    "target": "es2016",
    "module": "commonjs", 
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true 


# branches
- master (only for production)
- develop (for develop)
- features_branch (for local changes)


# Run
## Install dependecies
```npm install```

## Detect changes in typescript
```tsc --watch``` or ```tsc --w```

## Develop
```npm run dev```

## Production
```npm start```

## Build and Upload server production
1. ```npm run build```
2. compress dist, package.json 
3. upload to server

## deploy aws ec2
ssh ubuntu@3.12.57.157 -i we-u.pem



