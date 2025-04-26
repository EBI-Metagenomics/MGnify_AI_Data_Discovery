from setuptools import setup, find_packages

setup(
    name="oxford_mgnify",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    description="Oxford MGNify Project",
    author="Segun, Abdullah, Callum, Adam, Joshua, Grisha",
    install_requires=[
        line.strip() for line in open("requirements.txt")
        if not line.startswith("#") and line.strip()
    ],
    python_requires=">=3.8"
)