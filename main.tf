provider "aws" {
    region = "us-east-1"
}

#VPC 
resource "aws_vpc" "hypekicks_vpc" {
  cidr_block = "10.10.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    Name = "Hypekicks-vpc"
  }
}

#Subred publica del frontend
resource "aws_subnet" "subnet_public_ftn" { #subred publica del frontend
  vpc_id = aws_vpc.hypekicks_vpc.id
  cidr_block = "10.10.1.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "Hypekicks-public-ftn"
  }
}

#subred publica del jump server
resource "aws_subnet" "subnet_public_jump" { #subred publica del jump server
  vpc_id = aws_vpc.hypekicks_vpc.id
  cidr_block = "10.10.2.0/24"
  availability_zone = "us-east-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "Hypekicks-public-jump"
  }
  
}

#Subred privada del backend
resource "aws_subnet" "subnet_private_bkd" { #backend
  vpc_id = aws_vpc.hypekicks_vpc.id
  cidr_block = "10.10.3.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "Hypekicks-private-bkd"
  }
}

#Gateway para la VPC
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.hypekicks_vpc.id
  tags = {
    Name = "Hypekicks-igw"
  }
}

#Tabla de enrutamiento pública
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.hypekicks_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "Hypekicks-public-rt"
  }
}

#Asociación de la tabla de enrutamiento publica a las subredes publicas.
resource "aws_route_table_association" "public_subnet_ftn_assoc" {
  subnet_id = aws_subnet.subnet_public_ftn.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_subnet_jump" {
  subnet_id = aws_subnet.subnet_public_jump.id
  route_table_id = aws_route_table.public_rt.id
}

#Jump server Security Group // 
resource "aws_security_group" "jump_server_sg" {
  name_prefix = "hypekicks-jump-server-sg-"
  vpc_id      = aws_vpc.hypekicks_vpc.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["189.219.115.233/32"] # Reemplaza con tu IP pública
    description = "PermiteSSHDesdeMiIP"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # Permite todo el tráfico saliente
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "hypekicks-jump-server-sg"
  }
}

#Frontend Security Group
resource "aws_security_group" "frontend_sg" {
  name_prefix = "hypekicks-frontend-sg"
  vpc_id      = aws_vpc.hypekicks_vpc.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "TraficoHTTP"
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "TraficoHTTPS"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "Hypekicks-frontend-sg"
  }
}

#backend Security Group
resource "aws_security_group" "backend_sg" {
  name_prefix = "hypekicks-backend-sg-"
  vpc_id      = aws_vpc.hypekicks_vpc.id
  ingress {
    from_port   = 3000 # Reemplaza con el puerto de tu API backend
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.10.1.0/24", "10.10.2.0/24"] # Permite tráfico desde las subredes públicas (donde estará el frontend) - ¡AJUSTAR SI ES NECESARIO!
    description = "PermiteTraficoDesdeElFrontend"
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.10.1.0/24", "10.10.2.0/24"] # Permite SSH desde las subredes públicas (para el jump server) - ¡AJUSTAR SI ES NECESARIO!
    description = "PermiteSSHdesdelasSubredesPublicas"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "hypekicks-backend-sg"
  }
}

#Instancia EC2 Jump server
resource "aws_instance" "jump_server" {
  ami           = "ami-0e449927258d45bc4" #Linux 2023
  instance_type = "t2.micro"         
  subnet_id     = aws_subnet.subnet_public_jump.id
  vpc_security_group_ids = [aws_security_group.jump_server_sg.id]
  key_name      = "HypeKicks-Public-keys"       # Reemplaza con el nombre de tu clave SSH en AWS primero la tendremos que agregar
  tags = {
    Name = "hypekicks-jump-server"
  }
}


#Instancia EC2 Frontend
resource "aws_instance" "frontend_server" {
  ami           = "ami-0e449927258d45bc4" # Linux 2023
  instance_type = "t2.medium"        
  subnet_id     = aws_subnet.subnet_public_ftn.id
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]
  key_name      = "HypeKicks-Public-keys" #Se usara la que se creo
  tags = {
    Name = "hypekicks-frontend"
  }
}


#Instancia EC2 backend *Se usara la subred privada para mayor seguridad.
resource "aws_instance" "backend_server" {
  ami           = "ami-0e449927258d45bc4" # Linux 2023
  instance_type = "t2.medium"
  subnet_id     = aws_subnet.subnet_private_bkd.id
  vpc_security_group_ids = [aws_security_group.backend_sg.id]
  key_name      = "HypeKikcs-Private-keys" // se creara una llave solamente para esta instancia.
  tags = {
    Name = "hypekicks-backend"
  }
}
