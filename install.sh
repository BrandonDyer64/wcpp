cd {{homedir}}/.wcpp
echo cloning
git clone https://github.com/juj/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
