from setuptools import setup, find_packages

def read_requirements():
    with open('requirements.txt') as f:
        return f.read().splitlines()

setup(
    name="fin_pool",
    package_dir={"": "src"},
    install_requires=read_requirements(),
    packages=find_packages(
        "src", include=("src/fin_pool",), exclude=("tests",)
    ),
)